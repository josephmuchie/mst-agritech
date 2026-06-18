package com.mst.agritech.soap.catalog;

import jakarta.xml.bind.annotation.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@XmlRootElement(name = "GetProductsRequest", namespace = CatalogNamespace.NS)
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "GetProductsRequest", namespace = CatalogNamespace.NS,
        propOrder = {"search", "category", "username", "password"})
public class GetProductsRequest {
    @XmlElement(namespace = CatalogNamespace.NS)
    private String search;
    @XmlElement(namespace = CatalogNamespace.NS)
    private String category;
    @XmlElement(namespace = CatalogNamespace.NS)
    private String username;
    @XmlElement(namespace = CatalogNamespace.NS)
    private String password;
}
